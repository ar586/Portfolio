from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.tools.retriever import create_retriever_tool
from langchain_core.documents import Document
from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain.agents import create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv
import os

load_dotenv()

try:
    # Mock Retriever
    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
    # create empty vectorstore
    vectorstore = FAISS.from_texts(["hello"], embeddings)
    retriever = vectorstore.as_retriever()
    
    retriever_tool = create_retriever_tool(
        retriever,
        "portfolio_knowledge_base",
        "Searches knowledge base."
    )
    
    print(f"Retriever tool created: {retriever_tool}")

    from app.tools.stats_tools import fetch_github_stats, fetch_leetcode_stats
    print(f"Stats tools: {fetch_github_stats}, {fetch_leetcode_stats}")

    llm = ChatGoogleGenerativeAI(model="models/gemma-3-27b-it", temperature=0)
    
    tools = [retriever_tool, fetch_github_stats, fetch_leetcode_stats]
    
    # Try binding directly
    bound_llm = llm.bind_tools(tools)
    print(f"Bound LLM: {bound_llm}")
    
    # Try creating agent
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a helpful AI assistant."),
        ("placeholder", "{chat_history}"),
        ("human", "{input}"),
        ("placeholder", "{agent_scratchpad}"),
    ])
    
    print("Creating agent manually...")
    # agent = create_tool_calling_agent(llm, tools, prompt)
    
    from langchain.agents.format_scratchpad.tools import format_to_tool_messages
    from langchain.agents.output_parsers.tools import ToolsAgentOutputParser
    from langchain_core.runnables import RunnablePassthrough
    
    llm_with_tools = llm.bind_tools(tools)
    
    agent = (
        RunnablePassthrough.assign(
            agent_scratchpad=lambda x: format_to_tool_messages(x["intermediate_steps"])
        )
        | prompt
        | llm_with_tools
        | ToolsAgentOutputParser()
    )
    
    print(f"Agent created: {agent}")

except Exception as e:
    print(f"Exception happened: {e}")
    # import traceback
    # traceback.print_exc()
