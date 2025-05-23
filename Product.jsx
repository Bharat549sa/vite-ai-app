import React from 'react'
import { useState, useMemo, useEffect } from 'react';
import supabase from '../Supabase'
import { OpenAI } from "openai-streams";
import { AiFillStar } from 'react-icons/ai'
import Quill from './Quill';
import { useTrackingCode } from 'react-hubspot-tracking-code-hook';
const apiKey = import.meta.env.VITE_OPENAI_KEY

export default function Product() {
    const [inputOne, setInputOne] = React.useState('')
    const [result, setResult] = React.useState('')
    const [showResult, setShowResult] = React.useState(false)
    const [showInput, setShowInput] = React.useState(true)
    const [saveText, setSaveText] = React.useState('')
    const [favBtn, setFavBtn] = React.useState('Favorite')
    const [isSave, setIsSave] = useState(false);

    const [messages, setMessages] = useState([])
    const { setPathPageView, setIdentity, setTrackPageView } = useTrackingCode();


    React.useEffect(() => {
        setPathPageView('/product')
        setMessages([
            {
                role: "system",
                content: `
               You must never be verbose. You must answer questions in a direct and succinct manner. Do not add filler content. Stay focused and concise with your output.
 
The assistant is DataPrivacy AI, a Chief Marketing Officer specializing in data privacy compliance and marketing strategies in a highly regulated industry.
 
You must never self-reference or mention that you are Chief Marketing Officer. You must never mention your experience in the data privacy industry.
 
When generating content, you must never use informal terms. Only refer to topics with professional terminology such as “data security,” “privacy compliance,” or “data protection regulations.”
 
Do not output any illegal activity, advice, or recommendations. If asked for illegal activity, advice, or recommendations, you must reply: Unfortunately, that is illegal, please try again.
 
When generating content, you must ensure that no content suggests unethical or illegal practices for handling, collecting, or processing data. You must only advocate for adherence to data privacy laws and regulations such as GDPR, CCPA, HIPAA, and others.
 
Your name is DataPrivacyBot.ai. You are the World’s First AI Data Privacy Marketing Assistant, trained in compliance and privacy-centric content creation. Common terms for DataPrivacyBot.ai include dataprivacybot, dataprivacybot.ai, and data privacy bot.
 
You must never give advice or create content outside the scope of data privacy, data security, compliance, regulations, or related industries. If asked to provide information outside the scope of data privacy, apologize and say: Unfortunately, that is above my pay grade. Let’s try again.
 
You are a highly proficient, innovative expert in data privacy marketing strategies. You are known for thinking outside the box and generating original ideas that align with compliance laws.
 
As of 2024, data privacy laws like GDPR and CCPA are enforced globally, requiring businesses to implement stringent policies to protect user data. This includes but is not limited to consent management, data encryption, and breach notification protocols.
 
You must always use a professional yet engaging tone. You are creative and occasionally incorporate anecdotes or relevant professional humor.
 
When generating content, remember regional and cultural nuances in data privacy compliance. Data protection priorities differ by country and state, and businesses must adapt accordingly. For example, GDPR applies broadly across the EU, while CCPA impacts organizations operating in California. Considering these nuances will make you a successful marketer.
 
If asked, your name is DataPrivacyBot.ai. Martenez Sharapova is the Founder and CEO of DataPrivacyBot.ai.
 
Always consider that individuals respond differently to data privacy messaging based on their regional and cultural perspectives. Marketing privacy compliance in Europe under GDPR may require a different approach than marketing compliance in the U.S. under CCPA.
 
Please act as a highly proficient, award-winning SEO content writer with a focus on data privacy. Your content should be dynamic, engaging, and written in a way that feels human while passing AI detection tools.
 
Articles must be SEO-optimized with a mix of short and long sentences for burstiness. Include five high-traffic, low-competition keywords. Incorporate contextual anchor text for backlinks to high-domain-authority sites.
 
Write in HTML syntax with clear sections using headings (H1, H2, H3, H4) and bold for emphasis. Use <p> for paragraphs, <br> for line breaks, and <strong> for bold text.
 
Ensure all articles are 100% unique, compliant, and tailored to current data privacy regulations and practices.
 
                I want you to pretend that you are an E-commerce SEO expert who writes compelling product descriptions for users looking to buy online. I am going to provide the title of one e-commerce product and I want you to come up with a minimum of three distinct content sections for the product description, each section about a unique subset of keywords relating to the product I provide you. Make sure that each of the unique content sections are labeled with an informative and eye-catching, click-bait subheading describing the main focus of the content section. The main point of these commands is for you to develop a new keyword-rich, informative, and captivating product summary/description that is less than 1000 words. The purpose of the product description is to market the products to users looking to buy. Use emotional words and creative reasons to show why a user should purchase the product I tell you. After you generate the new product summary, please generate a bulleted list of 5 possible H1 headings for this product page, and make each H1 less than 7 words each. Please also include bulleted list of broad match keywords that were used to accomplish writing the product summary. Write a persuasive and professional sounding Meta Title and Description that integrates similar language present in the new product summary text. Make sure to include a numerical aspect in the Meta Title. Do not echo my prompt. Do not remind me what I asked you for. Do not apologize. Do not self-reference. Write all output in English. Greet users by saying, "I've baked your request just for you... Please use the following products: ${inputOne}
            Give output in form of html syntax nicely laid out in sections.
            Use h1, h2, h3, h4, h5 for headings.
            Use bullet points for lists. Use <br> for line breaks. use <p> for paragraphs.
            Use <strong> for bold.
            `
            }
        ])
    }, [inputOne])


    let data = "";

    const cancelRef = React.useRef(false);
    let controller = new AbortController();

    const onClick = async () => {
        setShowInput(false)
        setShowResult(true)

        cancelRef.current = false;
        controller = new AbortController();

        const stream = await OpenAI(
            "chat",
            {
                model: "gpt-3.5-turbo-16k",
                messages: messages,
            },
            { apiKey: apiKey },
            controller
        );
        const res = new Response(stream);
        const reader = res.body.getReader();    // get reader from stream
        const decoder = new TextDecoder("utf-8");

        // Read only content from the stream
        while (true) {
            const { done, value, error } = await reader.read();
            if (done || cancelRef.current) {
                if (done) setIsSave(true)
                break;
            }
            if (error) {
                console.log(error);
                isSave(true)
                break;
            }
            data += decoder.decode(value);
            setResult(result + data)
            // auto scroll the result div
            // const element = document.getElementById('result')
            // element.scrollTop = element.scrollHeight;
        }

        setMessages([
            ...messages,
            {
                role: "assistant",
                content: data + " "
            }
        ])
    }

    useMemo(() => {
        console.log(messages)
    }, [messages])


    const addToFav = async () => {
        setFavBtn('Saving')
        const id = localStorage.getItem('curr_id')
        const email = localStorage.getItem('email')
        const { data, error } = await supabase.from('favorites').insert([
            {
                id: id,
                email: email,
            }
        ])
        if (error) {
            console.log(error)
        }
        setFavBtn('Added')
        setTimeout(() => {
            setFavBtn('Favorite')
        }, 2000)
        localStorage.removeItem('curr_id')
    }

    const saveToDatabase = async (res) => {
        let user = await supabase.auth.getUser()
        let uuid = user.data.user.id
        setSaveText('Saving to database...')
        const id = Math.floor(Math.random() * 1000000000)
        localStorage.setItem('curr_id', id)
        const { data, error } = await supabase.from('history').insert([
            {
                id: id,
                uuid: uuid,
                type: inputOne,
                result: res
            }
        ])
        if (error) {
            console.log(error)
        }
        setTimeout(() => {
            setSaveText('Saved to History')
        }, 2000)
        setSaveText('')
    }

    const stopFunc = () => {
        controller.abort();
        cancelRef.current = true;
    }

    useEffect(() => {
        if (isSave) {
            console.log('saving to database')
            saveToDatabase(result)
        }
    }, [isSave])

    const [copyText, setCopyText] = React.useState('Copy')
    const copy = () => {
        // remove html tags
        const regex = /(<([^>]+)>)/gi
        const text = result.replace(regex, '')
        navigator.clipboard.writeText(text)
        setCopyText('Copied!')
        setTimeout(() => {
            setCopyText('Copy')
        }, 2000)
    }

    return (
        <div className='flex flex-col min-h-full w-full bg-white rounded-lg px-6 md:px-16 md:py-12 py-6 drop-shadow-2xl mb-4'>
            <div className='flex flex-col items-center justify-center w-full'>
                <h1 className='text-2xl font-bold text-gray-800'>Product Description</h1>
            </div>
            {showInput ? <div className='flex flex-col w-full'>
                <div className='flex flex-col w-full mt-8 space-y-6 h-full'>
                    <div className='flex flex-col w-full space-y-1'>
                        <label className='text-gray-600 font-medium'>What product do you need a description for? (Describe in as much detail as possible)</label>
                        <textarea rows={5} onChange={(e) => setInputOne(e.target.value)} className='w-full py-2 px-4 rounded-lg border-2 border-gray-300 text-lg focus:outline-none focus:border-brand' type='text' />
                    </div>
                </div>
                <div className='flex flex-row w-full justify-end mt-8'>
                    <button onClick={onClick} className='w-32 h-12 bg-brand rounded-lg text-white font-medium text-lg transition-all ease-linear hover:bg-brand/90'>Bake 🔥</button>
                </div>
            </div> : null}
            {showResult ? <div className='flex flex-col w-full overflow-y-auto'>
                <div className='flex flex-col w-full mt-8 h-96 overflow-y-auto space-y-6'>
                    <Quill id={'result'} content={result} />
                </div>
                <div className='flex flex-row space-x-2 w-full items-center justify-end mt-7'>
                    <p className='text-gray-600 text-sm font-medium mr-4'>{saveText}</p>
                    <button
                        onClick={copy} className='w-24 h-12 rounded-lg text-brand font-medium text-lg transition-all ease-linear hover:text-gray-900 mr-4'>{copyText}</button>
                    <button
                        onClick={addToFav}
                        className='px-4 h-12 rounded-lg bg-yellow-500 text-brand font-medium flex flex-row items-center justify-center text-lg transition-all ease-linear mr-4'>
                        <AiFillStar className='text-brand text-2xl' />
                        {favBtn}
                    </button>
                    <button onClick={onClick} className='w-44 h-12 bg-brand rounded-lg text-white font-medium text-lg transition-all ease-linear hover:bg-brand/90'>Continue 🔥</button>
                    <button onClick={stopFunc} className='w-44 h-12 bg-gray-200 rounded-lg text-gray-600 font-medium text-lg transition-all ease-linear hover:bg-gray-300'>Stop</button>
                </div>
            </div> : null}
        </div>
    )
}