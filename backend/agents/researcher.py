import os
from crewai import Agent
from langchain_groq import ChatGroq
from crewai_tools import SerperDevTool

llm = ChatGroq(
    api_key=os.getenv("GROQ_API_KEY"),
    model_name="llama3-70b-8192"
)

researcher_agent = Agent(
    role='Market Researcher',
    goal='Provide deep insights into market trends and competition.',
    backstory='A data-driven analyst who uncovers hidden opportunities.',
    tools=[SerperDevTool()],
    llm=llm,
    verbose=True
)
