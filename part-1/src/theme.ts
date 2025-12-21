import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        // Elegant Blue Palette
        blue: {
          50: { value: "#f0f7ff" },
          100: { value: "#e0effe" },
          200: { value: "#bae0fd" },
          300: { value: "#7cc5fb" },
          400: { value: "#36a4f9" },
          500: { value: "#0c87eb" },
          600: { value: "#0069ca" },
          700: { value: "#0154a3" },
          800: { value: "#064787" },
          900: { value: "#0b3b6f" },
          950: { value: "#07264a" },
        },
      },
    },
    semanticTokens: {
      colors: {
        bg: {
          canvas: {
            value: { _light: "{colors.white}", _dark: "{colors.black}" },
          },
          panel: {
            value: { _light: "{colors.white}", _dark: "{colors.gray.950}" },
          },
          subtle: {
            value: { _light: "{colors.blue.50}", _dark: "{colors.gray.900}" },
          },
          muted: {
            value: { _light: "{colors.gray.50}", _dark: "{colors.gray.900}" },
          },
        },
        fg: {
          default: {
            value: { _light: "{colors.gray.950}", _dark: "{colors.white}" },
          },
          muted: {
            value: { _light: "{colors.gray.600}", _dark: "{colors.gray.400}" },
          },
          subtle: {
            value: { _light: "{colors.gray.500}", _dark: "{colors.gray.500}" },
          },
        },
        border: {
          DEFAULT: {
            value: { _light: "{colors.gray.200}", _dark: "{colors.gray.800}" },
          },
          muted: {
            value: { _light: "{colors.gray.100}", _dark: "{colors.gray.900}" },
          },
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)
