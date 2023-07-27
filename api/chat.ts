import { OpenAIStream, StreamingTextResponse } from 'ai'
import { Configuration, OpenAIApi } from 'openai-edge'

export const config = {
  runtime: 'edge'
}
// Create an OpenAI API client (that's edge friendly!)
const aiconfig = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(aiconfig)
export default async (req: Request, response: Response) => {
  try {
    const response = await openai.createChatCompletion({
      max_tokens: 2000,
      temperature: 0.9,
      messages: [
        {
          content: 'You are a smart bot',
          role: 'system'
        },
        {
          content: 'Write me a long poem about space',
          role: 'user'
        }
      ],
      stream: true,
      model: 'gpt-3.5-turbo'
    })

    const stream = OpenAIStream(response, {
      onStart: async () => {
        console.log('started')
      },
      onCompletion: async (completion: string) => {
        console.log('Complete', completion)
      }
    })

    return new StreamingTextResponse(stream)
  } catch (e: any) {
    console.error(e)
    return new Response(
      JSON.stringify({
        error: e.message || 'Unknown error',
        success: false
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}
