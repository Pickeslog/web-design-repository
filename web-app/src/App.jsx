import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@emotion/react'
import AppRouter from './routes/AppRouter'
import { theme } from './styles/theme'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <AppRouter />
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
