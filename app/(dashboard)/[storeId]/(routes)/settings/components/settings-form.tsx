'use client'

import { Store } from '@prisma/client'
import { TrashIcon } from 'lucide-react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { useParams, useRouter } from 'next/navigation'
import { AlertModal } from '@/components/modals/alert-modal'
import { ApiAlert } from '@/components/ui/api-alert'
import { useOrigin } from '@/hooks/use-origin'

interface SettingsFormInterface {
  initialData: Store
}

const formSchema = z.object({
  name: z.string().min(1),
})

type SettingsFormValues = z.infer<typeof formSchema>

export function SettingsForm({ initialData }: SettingsFormInterface) {
  const params = useParams()
  const router = useRouter()
  const origin = useOrigin()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData.name,
    },
  })

  const onSubmit = async (values: SettingsFormValues) => {
    setLoading(true)
    try {
      await axios.patch(`/api/stores/${params.storeId}`, values)
      router.refresh()
      toast.success('Store updated.')
    } catch (error) {
      toast.error('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async () => {
    setLoading(true)
    try {
      await axios.delete(`/api/stores/${params.storeId}`)
      router.refresh()
      router.push('/')
      toast.success('Store deleted.')
    } catch (error) {
      toast.error('Make sure you removed all products and categories first.')
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  return (
    <>
      <AlertModal
        isOpen={open}
        loading={loading}
        onClose={() => {
          setOpen(false)
        }}
        onConfirm={onDelete}
      />

      <div className="flex items-center justify-between">
        <Heading title="Settings" description="Manage store preferences" />
        <Button
          variant="destructive"
          size="icon"
          disabled={loading}
          onClick={() => {
            setOpen(true)
          }}
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
      <Separator />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Store name"
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={loading} type="submit" className="ml-auto">
            Continue
          </Button>
        </form>
      </Form>

      <Separator />
      <ApiAlert
        title="NEXT_PUBLIC_API_URL"
        description={`${origin}/api/${params.storeId}`}
        variant="public"
      />
    </>
  )
}
