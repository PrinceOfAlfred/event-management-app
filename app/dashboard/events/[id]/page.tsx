"use client"

import { Input } from "@/components/ui/input"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Calendar, Check, Clock, Edit, MapPin, Share, Trash2, Users } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import {
  type Event,
  type Profile,
  deleteEvent,
  getEvent,
  getEventAttendees,
  getProfile,
  joinEvent,
  leaveEvent,
} from "@/lib/supabase"
import { useAuth } from "@/lib/auth-provider"

type AttendeeWithProfile = {
  id: string
  created_at: string
  event_id: string
  user_id: string
  profiles: Profile
}

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [organizer, setOrganizer] = useState<Profile | null>(null)
  const [attendees, setAttendees] = useState<AttendeeWithProfile[]>([])
  const [isAttending, setIsAttending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)

  // Fetch event details and attendees
  useEffect(() => {
    async function loadEventData() {
      try {
        // Fetch event details
        const eventData = await getEvent(params.id)
        setEvent(eventData)

        // Fetch event organizer
        const organizerData = await getProfile(eventData.user_id)
        setOrganizer(organizerData)

        // Fetch attendees
        const attendeesData = await getEventAttendees(params.id)
        setAttendees(attendeesData as AttendeeWithProfile[])

        // Check if current user is attending
        if (user) {
          const isUserAttending = attendeesData.some((attendee) => attendee.user_id === user.id)
          setIsAttending(isUserAttending)
        }

        setLoading(false)
      } catch (error) {
        console.error("Error loading event data:", error)
        toast({
          variant: "destructive",
          title: "Failed to load event",
          description: "There was an error loading the event details.",
        })
        router.push("/dashboard")
      }
    }

    loadEventData()
  }, [params.id, user, router, toast])

  // Handle join event
  const handleJoinEvent = async () => {
    if (!user || !event) return

    setActionLoading(true)

    try {
      await joinEvent(event.id, user.id)

      // Update attendees list
      const updatedAttendees = await getEventAttendees(event.id)
      setAttendees(updatedAttendees as AttendeeWithProfile[])
      setIsAttending(true)

      toast({
        title: "Success",
        description: "You have joined this event.",
      })
    } catch (error) {
      console.error("Error joining event:", error)
      toast({
        variant: "destructive",
        title: "Failed to join event",
        description: "There was an error joining this event. Please try again.",
      })
    } finally {
      setActionLoading(false)
    }
  }

  // Handle leave event
  const handleLeaveEvent = async () => {
    if (!user || !event) return

    setActionLoading(true)

    try {
      await leaveEvent(event.id, user.id)

      // Update attendees list
      const updatedAttendees = await getEventAttendees(event.id)
      setAttendees(updatedAttendees as AttendeeWithProfile[])
      setIsAttending(false)

      toast({
        title: "Success",
        description: "You have left this event.",
      })
    } catch (error) {
      console.error("Error leaving event:", error)
      toast({
        variant: "destructive",
        title: "Failed to leave event",
        description: "There was an error leaving this event. Please try again.",
      })
    } finally {
      setActionLoading(false)
    }
  }

  // Handle delete event
  const handleDeleteEvent = async () => {
    if (!event) return

    setDeleting(true)

    try {
      await deleteEvent(event.id)

      toast({
        title: "Event deleted",
        description: "The event has been deleted successfully.",
      })

      router.push("/dashboard/my-events")
    } catch (error) {
      console.error("Error deleting event:", error)
      toast({
        variant: "destructive",
        title: "Failed to delete event",
        description: "There was an error deleting the event. Please try again.",
      })
      setDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  // Handle share event
  const handleShareEvent = async () => {
    const eventUrl = `${window.location.origin}/dashboard/events/${params.id}`

    try {
      await navigator.clipboard.writeText(eventUrl)
      toast({
        title: "Link copied",
        description: "Event link copied to clipboard.",
      })
      setShareDialogOpen(false)
    } catch (error) {
      console.error("Error copying to clipboard:", error)
      toast({
        variant: "destructive",
        title: "Failed to copy link",
        description: "There was an error copying the link. Please try again.",
      })
    }
  }

  if (loading) {
    return (
      <div className="container py-6">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-24" />
          </div>

          <div className="aspect-video w-full rounded-lg">
            <Skeleton className="h-full w-full" />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-4 md:col-span-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>

            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container py-6">
        <div className="mx-auto max-w-4xl rounded-lg border p-8 text-center">
          <h1 className="text-2xl font-bold">Event not found</h1>
          {/* eslint-disable-next-line react/no-unescaped-entities*/}
          <p className="mt-2 text-muted-foreground">The event you're looking for doesn't exist or has been removed.</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard">Go back to dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  const isOrganizer = user?.id === event.user_id

  return (
    <div className="container py-6">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{event.title}</h1>
            <p className="text-muted-foreground">
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize">
                {event.status}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {isOrganizer && (
              <>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/dashboard/events/${event.id}/edit`} className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Edit
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" onClick={() => setShareDialogOpen(true)}>
              <Share className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
          {event.image_url ? (
            <img src={event.image_url || "/placeholder.svg"} alt={event.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center bg-primary/10">
              <Calendar className="h-24 w-24 text-primary/40" />
            </div>
          )}
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-6 md:col-span-2">
            <div>
              <h2 className="text-xl font-bold">About this event</h2>
              <p className="mt-2 whitespace-pre-line text-muted-foreground">{event.description}</p>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-bold">Organizer</h2>
              {organizer && (
                <div className="mt-4 flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={organizer.avatar_url || undefined} alt={organizer.first_name} />
                    <AvatarFallback>
                      {`${organizer.first_name[0]}${organizer.last_name[0]}`.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {organizer.first_name} {organizer.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">{organizer.email}</p>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Attendees</h2>
                <span className="text-sm text-muted-foreground">
                  {attendees.length} {attendees.length === 1 ? "person" : "people"} attending
                </span>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {attendees.length > 0 ? (
                  attendees.map((attendee) => (
                    <div key={attendee.id} className="flex items-center gap-3 rounded-lg border p-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={attendee.profiles.avatar_url || undefined}
                          alt={attendee.profiles.first_name}
                        />
                        <AvatarFallback>
                          {`${attendee.profiles.first_name[0]}${attendee.profiles.last_name[0]}`.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {attendee.profiles.first_name} {attendee.profiles.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">{attendee.profiles.email}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 rounded-lg border border-dashed p-6 text-center">
                    <p className="text-muted-foreground">No one has joined this event yet. Be the first to join!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
                <CardDescription>Information about the event</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{format(new Date(event.date), "EEEE, MMMM d, yyyy")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {attendees.length} {attendees.length === 1 ? "attendee" : "attendees"}
                  </span>
                </div>

                {!isOrganizer && (
                  <Button
                    className="mt-4 w-full"
                    variant={isAttending ? "outline" : "default"}
                    disabled={actionLoading}
                    onClick={isAttending ? handleLeaveEvent : handleJoinEvent}
                  >
                    {actionLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        {isAttending ? "Leaving..." : "Joining..."}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {isAttending ? (
                          <>
                            <Check className="h-4 w-4 bg-green-500" />
                            Attending
                          </>
                        ) : (
                          "Join Event"
                        )}
                      </div>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Share this event</CardTitle>
                <CardDescription>Invite others to join</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => setShareDialogOpen(true)}>
                  <Share className="mr-2 h-4 w-4" />
                  Share Event
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteEvent} disabled={deleting}>
              {deleting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Deleting...
                </div>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Event</DialogTitle>
            <DialogDescription>Share this event with friends and colleagues.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <Input readOnly value={`${window.location.origin}/dashboard/events/${params.id}`} />
            <Button onClick={handleShareEvent}>Copy</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

