"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Heading,
  Input,
  Stack,
  Text,
  Link as ChakraLink,
  Flex,
  VStack,
} from "@chakra-ui/react";
import { Field } from "@/components/ui/field";
import { loginSchema, LoginFormData } from "@/schemas/auth";
import Link from "next/link";
import { useState } from "react";
import { Toaster, toaster } from "@/components/ui/toaster";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        toaster.create({
          title: "Login failed",
          description: "Invalid email or password",
          type: "error",
        });
      } else {
        toaster.create({
          title: "Login successful",
          description: "Redirecting...",
          type: "success",
        });

        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      toaster.create({
        title: "An error occurred",
        description: "Please try again later",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg="gray.50"
      _dark={{ bg: "black" }} // Deepest black for high contrast background
      p={4}
    >
      <Toaster />
      <Box
        w="full"
        maxW="md"
        bg="white"
        _dark={{ 
          bg: "gray.900", // "Surface" color: slightly lighter than background
          borderColor: "gray.800" // Subtle border in dark mode
        }}
        rounded="2xl"
        shadow="xl"
        p={{ base: 6, md: 10 }}
        borderWidth="1px"
        borderColor="gray.100"
      >
        <VStack gap={8} align="stretch">
          <VStack gap={2} textAlign="center">
            <Heading 
              size="3xl" 
              letterSpacing="tight" 
              _dark={{ color: "white" }}
            >
              Welcome Back
            </Heading>
            <Text 
              color="gray.500" 
              fontSize="md"
              _dark={{ color: "gray.400" }}
            >
              Enter your credentials to access your account
            </Text>
          </VStack>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack gap={5}>
              <Field
                label="Email"
                invalid={!!errors.email}
                errorText={errors.email?.message}
              >
                <Input
                  {...register("email")}
                  size="lg"
                  type="email"
                  placeholder="name@example.com"
                  variant="subtle"
                  _dark={{ 
                    bg: "gray.800", // Distinct input background
                    color: "white",
                    borderColor: "transparent",
                    _focus: { borderColor: "blue.500", bg: "gray.800" },
                    _placeholder: { color: "gray.500" }
                  }}
                />
              </Field>

              <Field
                label="Password"
                invalid={!!errors.password}
                errorText={errors.password?.message}
              >
                <Input
                  {...register("password")}
                  size="lg"
                  type="password"
                  placeholder="••••••••"
                  variant="subtle"
                  _dark={{ 
                    bg: "gray.800",
                    color: "white",
                    borderColor: "transparent",
                    _focus: { borderColor: "blue.500", bg: "gray.800" },
                    _placeholder: { color: "gray.500" }
                  }}
                />
              </Field>

              <Button
                type="submit"
                loading={isLoading}
                width="full"
                size="lg"
                colorPalette="blue"
                fontWeight="bold"
                mt={2}
                _dark={{
                    color: "white",
                    _hover: { bg: "blue.600" }
                }}
              >
                Sign in
              </Button>
            </Stack>
          </form>

          <Text 
            textAlign="center" 
            fontSize="sm" 
            color="gray.500"
            _dark={{ color: "gray.400" }}
          >
            Don&apos;t have an account?{" "}
            <ChakraLink asChild colorPalette="blue" fontWeight="semibold">
              <Link href="/signup">Sign up</Link>
            </ChakraLink>
          </Text>
        </VStack>
      </Box>
    </Flex>
  );
}