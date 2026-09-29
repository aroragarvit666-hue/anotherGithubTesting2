import React, { useState } from 'react'
import {
  Provider,
  defaultTheme,
  View,
  Flex,
  Heading,
  Content,
  Text,
  Form,
  TextField,
  Button,
  ProgressCircle,
  InlineAlert
} from '@adobe/react-spectrum'
import actions from '../config.json'

export default function App({ runtime, ims }) {
  // Do NOT call runtime.done() here — index.js calls it in the ready handler
  const helloUrl = actions['hello']

  const [name, setName] = useState('')
  const [greeting, setGreeting] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  async function onSubmit(e) {
    e.preventDefault()
    setError(null)
    setGreeting(null)

    if (!helloUrl) {
      // config.json is empty until the app is deployed or the sandbox is running
      setError('Action URL not available yet. Deploy the app or start the dev sandbox, then try again.')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(helloUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ims.token}`,
          'x-gw-ims-org-id': ims.org
        },
        body: JSON.stringify({ name })
      })
      if (!res.ok) throw new Error(`Action failed: ${res.status}`)
      const data = await res.json()
      setGreeting(data.message)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Provider theme={defaultTheme}>
      <View padding="size-400" maxWidth="size-6000" marginX="auto">
        <Flex direction="column" gap="size-300">
          <Heading level={1}>Hello World</Heading>
          <Content>
            <Text>Enter a name and call the App Builder action to get a greeting.</Text>
          </Content>

          <Form onSubmit={onSubmit} maxWidth="size-3600">
            <TextField
              label="Name"
              value={name}
              onChange={setName}
              placeholder="World"
              autoFocus
            />
            <Button variant="accent" type="submit" isPending={isLoading} marginTop="size-200">
              Say hello
            </Button>
          </Form>

          {isLoading && (
            <Flex alignItems="center" justifyContent="center" height="size-1200">
              <ProgressCircle aria-label="Calling action" isIndeterminate size="L" />
            </Flex>
          )}

          {greeting && (
            <InlineAlert variant="positive">
              <Heading>Success</Heading>
              <Content>{greeting}</Content>
            </InlineAlert>
          )}

          {error && (
            <InlineAlert variant="negative">
              <Heading>Error</Heading>
              <Content>{error}</Content>
            </InlineAlert>
          )}
        </Flex>
      </View>
    </Provider>
  )
}
