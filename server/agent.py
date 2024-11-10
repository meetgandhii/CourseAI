# from uagents import Agent, Context, Model
# from fastapi import FastAPI, HTTPException
# import uvicorn
# from pydantic import BaseModel

# app = FastAPI()

# class ContextPrompt(Model):
#     content: str

# class Response(Model):
#     text: str

# class QuestionRequest(Model):
#     topic: str
#     numberOfQuestions: int

# class QuestionResponse(Model):
#     response: str

# agent = Agent(
#     name="quiz_agent"
# )

# AI_AGENT_ADDRESS = "agent1q0h70caed8ax769shpemapzkyk65uscw4xwk6dc4t3emvp5jdcvqs9xs32y"

# response_data = None

# @agent.on_rest_post('/generate-questions', QuestionResponse):
# async def handle_post(ctx: Context, req: QuestionRequest, res: QuestionResponse):
#     prompt = ContextPrompt(content=f"Generate {req.numberOfQuestions} multiple-choice questions about {req.topic}. For each question, provide one correct answer and three incorrect answers. Format the response as a JSON array of objects with the following structure: {{ \"question\": \"...\", \"correct_answer\": \"...\", \"incorrect_answers\": [\"...\", \"...\", \"...\"], \"all_answers\": [\"...\", \"...\", \"...\", \"...\"] }}.")
#     await ctx.send(AI_AGENT_ADDRESS, prompt)

# @agent.on_message(Response)
# async def handle_response(ctx: Context, sender: str, msg: Response):
#     global response_data
#     response_data = msg.text
    
# '''
# @app.post("/generate-questions")
# async def generate_questions(request: QuestionRequest):
#     global response_data
#     response_data = None
    
#     prompt = ContextPrompt(content=f"Generate {request.numberOfQuestions} multiple-choice questions about {request.topic}. For each question, provide one correct answer and three incorrect answers. Format the response as a JSON array of objects with the following structure: {{ \"question\": \"...\", \"correct_answer\": \"...\", \"incorrect_answers\": [\"...\", \"...\", \"...\"], \"all_answers\": [\"...\", \"...\", \"...\", \"...\"] }}.")
    
#     await ctx.send(AI_AGENT_ADDRESS, prompt)
    
#     # Wait for response with timeout
#     timeout = 30  # 30 seconds timeout
#     while timeout > 0 and response_data is None:
#         await asyncio.sleep(1)
#         timeout -= 1
    
#     if response_data is None:
#         raise HTTPException(status_code=408, detail="Request timeout")
        
#     return {"response": response_data}

# @agent.on_message(Response)
# async def handle_response(ctx: Context, sender: str, msg: Response):
#     global response_data
#     response_data = msg.text

# if __name__ == "__main__":
#     uvicorn.run(app, host="0.0.0.0", port=8000)
# '''
