import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import api from "@/lib/axios"
import { Loader2, Truck } from "lucide-react"

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
})

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    
    try {
      const response = await api.post("/auth/login", values)
      
      // Validate response structure
      if (!response.data || response.data.status !== "success") {
        throw new Error("Invalid response from server")
      }

      const { accessToken, refreshToken, data } = response.data
      
      // Validate required fields
      if (!accessToken || !refreshToken || !data?.user) {
        throw new Error("Missing required authentication data")
      }
      
      login(accessToken, refreshToken, data.user)
      toast.success("Welcome back!")
      navigate("/analytics")
    } catch (error: any) {
      console.error("Login error:", error)
      
      // Handle different error types
      if (error.response?.status === 401) {
        toast.error("Invalid email or password", { duration: 4000 })
      } else if (error.response?.status === 404) {
        toast.error("Account not found", { duration: 4000 })
      } else if (error.response?.status === 403) {
        toast.error("Account is disabled or deleted", { duration: 4000 })
      } else if (error.response?.status >= 500) {
        toast.error("Server error. Please try again later", { duration: 4000 })
      } else if (error.code === "ERR_NETWORK") {
        toast.error("Network error. Please check your connection", { duration: 4000 })
      } else {
        toast.error(error.response?.data?.message || error.message || "Failed to login", { duration: 4000 })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-background via-muted/50 to-muted p-4">
      <div className="w-full max-w-md">
        {/* Logo and Brand */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
            <Truck className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">A D M I N</h1>
          <p className="text-sm text-muted-foreground">Manage your fleet with ease</p>
        </div>

        <Card className="border-2 shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="owner@example.com" 
                          type="email"
                          autoComplete="email"
                          disabled={isLoading}
                          className="h-11"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Enter your password"
                          autoComplete="current-password"
                          disabled={isLoading}
                          className="h-11"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full h-11 text-base font-medium" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>
            </Form>
            
            {/* Demo Credentials */}
            <div className="mt-6 rounded-lg bg-muted p-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">Demo Credentials:</p>
              <div className="space-y-1 text-xs font-mono">
                <p>Email: admin@fleet.com</p>
                <p>Password: password</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Fleet Management. All rights reserved.
        </p>
      </div>
    </div>
  )
}
