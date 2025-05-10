import React from 'react'
import supabase from '../supabase'
import { checkUserPlan, initialCheck } from './functions'

function PlanCheck() {
    const checkActivePlan = async () => {
        // const plan = await checkUserPlan()
        // const sevenDays = await initialCheck()
        // if(sevenDays === false){
        //     window.location.href = '/dashboard'
        // } else {
        //     if(plan === true){
        //         window.location.href = '/dashboard'
        //     } else {
        //         window.location.href = '/pricing'
        //     }
        // }
        window.location.href = '/dashboard'
    }

    React.useEffect(() => {
        checkActivePlan()
    }, [])

    return (
        <div className='flex flex-row items-center justify-center h-screen w-full'>
            Logging you in...
        </div>
    )
}

export default PlanCheck