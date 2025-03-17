import { redirect } from 'next/navigation'

export default function Home() {
  // In a real implementation, this would check the auth state
  // For now, redirect to the root landing page
  redirect('/root')
}
