import { login } from './actions'
import { ClientLoginForm } from './ClientLoginForm'

export default async function LoginPage(props: {
  searchParams: Promise<{ message?: string }>
}) {
  const searchParams = await props.searchParams;

  return (
    <div className="flex-1 flex flex-col w-full px-4 justify-center items-center mx-auto h-screen bg-background relative overflow-hidden">
      {/* Background glow effects matching portfolio */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] -z-10"></div>
      
      <ClientLoginForm loginAction={login} errorMessage={searchParams?.message} />
    </div>
  )
}
