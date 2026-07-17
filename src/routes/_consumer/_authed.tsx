import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_consumer/_authed')({
  beforeLoad: ({ context }) => {
    if (!context.userId) {
      throw redirect({
        to: '/login',
        search: {
          redirect: window?.location?.href,
        },
      })
    }
  },
  component: () => <Outlet />,
})
