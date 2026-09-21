import NetworkClient from './NetworkClient'
import { BelovedHeader } from '@/components/BelovedHeader'

export const dynamic='force-dynamic'

export default function NetworkPage(){
 return <main className="min-h-screen bg-[#f7f4ed] text-[#17364d]"><BelovedHeader/><NetworkClient/></main>
}
