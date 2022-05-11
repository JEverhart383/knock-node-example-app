import { useRef } from "react"
import { Box, Flex, Text } from "@chakra-ui/layout"
import { useRouter, useMutation } from "blitz"

import {
  Avatar,
  Checkbox,
  FormControl,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Link,
  useDisclosure,
} from "@chakra-ui/react"
import { Input } from "@chakra-ui/input"
import { Field } from "formik"

import {
  KnockFeedProvider,
  NotificationIconButton,
  NotificationFeedPopover,
} from "@knocklabs/react-notification-feed"

import "@knocklabs/react-notification-feed/dist/index.css"

import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import updateUser from "app/users/mutations/updateUser"
import { Form } from "app/core/components/Form"

type Props = {
  children?: React.ReactElement
}

const Layout: React.FC<Props> = ({ children }) => {
  const router = useRouter()
  const { slug } = router.query
  const { user, refetchUser } = useCurrentUser()
  const { isOpen: isFeedOpen, onOpen: onOpenFeed, onClose: onCloseFeed } = useDisclosure()
  const {
    isOpen: isSettingsModalOpen,
    onOpen: onOpenSettingsModal,
    onClose: onCloseSettingsModal,
  } = useDisclosure()
  const [updateUserMutation] = useMutation(updateUser)

  const notifButtonRef = useRef(null)

  if (!user) {
    return null
  }

  return (
    <>
      <Flex flexDirection="column" width="100vw" height="100vh">
        <Flex
          as="header"
          alignItems="center"
          backgroundColor="gray.50"
          borderBottomColor="gray.200"
          borderBottomWidth={1}
          px={6}
          py={3}
        >
          <Text
            textTransform="uppercase"
            letterSpacing={2}
            fontSize={16}
            color="blue.500"
            fontWeight={600}
          >
            Collab
          </Text>
          <Box ml="auto">
            <KnockFeedProvider
              host={process.env.BLITZ_PUBLIC_KNOCK_HOST}
              apiKey={process.env.BLITZ_PUBLIC_KNOCK_CLIENT_ID!}
              feedId={process.env.BLITZ_PUBLIC_KNOCK_FEED_ID!}
              userId={`${user.id}`}
            >
              <Box ml="auto">
                <NotificationIconButton ref={notifButtonRef} onClick={onOpenFeed} />
                <NotificationFeedPopover
                  buttonRef={notifButtonRef}
                  isVisible={isFeedOpen}
                  onClose={onCloseFeed}
                />
              </Box>
            </KnockFeedProvider>
          </Box>
          {user?.name ? (
            <Avatar cursor="pointer" size="xs" name={user.name} onClick={onOpenSettingsModal} />
          ) : (
            ""
          )}
        </Flex>
        <Box flex={1} width="100%">
          {children}
        </Box>
      </Flex>
      <Modal isOpen={isSettingsModalOpen} onClose={onCloseSettingsModal}>
        <ModalOverlay />
        <ModalContent overflow="hidden">
          <ModalHeader p={5} bg="red.200" borderColor="black" borderBottomWidth={1}>
            Update settings
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody p={5}>
            <Box background="beige.100">
              <Form
                submitText="Update"
                initialValues={{ name: user.name, emailNotifications: user.emailNotifications }}
                onSubmit={async (values) => {
                  await updateUserMutation(values)
                  refetchUser()
                  onCloseSettingsModal()
                }}
              >
                <FormControl>
                  <Text
                    as="label"
                    textStyle="formLabel"
                    color="gray.600"
                    textAlign="left"
                    display="block"
                    mr={2}
                  >
                    Name
                  </Text>
                  <Field name="name">
                    {({ field }) => <Input placeholder="Project Name" {...field} />}
                  </Field>
                </FormControl>
                <FormControl mt={4}>
                  <Text
                    as="label"
                    textStyle="formLabel"
                    color="gray.600"
                    textAlign="left"
                    display="block"
                    mr={2}
                  >
                    Do you want to receive emails?
                  </Text>
                  <Field name="emailNotifications">
                    {({ field }) => (
                      <Checkbox isChecked={field.value} {...field}>
                        Yes
                      </Checkbox>
                    )}
                  </Field>
                </FormControl>
              </Form>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

export default Layout
