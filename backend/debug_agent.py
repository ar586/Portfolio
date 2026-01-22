from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.tools import tool
from dotenv import load_dotenv
import os

load_dotenv()

@tool
def add(a: int, b: int) -> int:
    """Adds two numbers."""
    return a + b

try:
    llm = ChatGoogleGenerativeAI(model="models/gemma-3-27b-it", temperature=0)
    print(f"LLM created: {llm}")
    
    if hasattr(llm, "bind_tools"):
        print("LLM has bind_tools method.")
        bound_llm = llm.bind_tools([add])
        print(f"Bound LLM: {bound_llm}")
        if bound_llm is None:
            print("ERROR: bind_tools returned None!")
    else:
        print("ERROR: LLM does not have bind_tools method.")

except Exception as e:
    print(f"Exception happened: {e}")
    import traceback
    traceback.print_exc()
