"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Event, getEvents } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-provider";

export default function DashboardPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"upcoming" | "all">("upcoming");

  // Fetch events on component mount
  useEffect(() => {
    async function loadEvents() {
      try {
        const fetchedEvents = await getEvents();
        setEvents(fetchedEvents);
        setFilteredEvents(fetchedEvents);
        setLoading(false);
      } catch (error) {
        console.error("Error loading events:", error);
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  // Handle search and filtering
  useEffect(() => {
    let result = events;

    // Filter by search query
    if (searchQuery) {
      result = result.filter(
        (event) =>
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by tab selection
    if (view === "upcoming") {
      result = result.filter((event) => event.status === "upcoming");
    }

    setFilteredEvents(result);
  }, [searchQuery, view, events]);

  if (loading) {
    return (
      // Welcome message
      <div className="container py-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">
                Welcome, {user?.first_name}
              </h1>
              <p className="text-muted-foreground">
                Explore upcoming events or create your own
              </p>
            </div>
            <Button asChild>
              <Link
                href="/dashboard/create-event"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Event
              </Link>
            </Button>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search events..."
                className="w-full pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Tabs
              defaultValue="upcoming"
              className="w-full sm:w-auto"
              onValueChange={(value) => setView(value as "upcoming" | "all")}
            >
              <TabsList>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="all">All Events</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Skeleton Loader */}
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="overflow-hidden w-full">
              <div className="aspect-video animate-pulse bg-muted" />
              <CardHeader>
                <div className="h-6 w-2/3 animate-pulse rounded-md bg-muted" />
                <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
                  <div className="h-4 w-2/3 animate-pulse rounded-md bg-muted" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    // Welcome message
    <div className="container py-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome, {user?.first_name}
            </h1>
            <p className="text-muted-foreground">
              Explore upcoming events or create your own
            </p>
          </div>
          <Button asChild>
            <Link
              href="/dashboard/create-event"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Event
            </Link>
          </Button>
        </div>

        {/* Search Bar and Filter */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search events..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Tabs
            defaultValue="upcoming"
            className="w-full sm:w-auto"
            onValueChange={(value) => setView(value as "upcoming" | "all")}
          >
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="all">All Events</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <div className="text-muted-foreground">
            <h3 className="text-lg font-medium">No events found</h3>
            <p className="mt-1">
              No events match your search criteria or there are no events yet.
            </p>
          </div>
          <Button asChild className="mt-4">
            <Link
              href="/dashboard/create-event"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Event
            </Link>
          </Button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <Link key={event.id} href={`/dashboard/events/${event.id}`}>
              <Card className="h-full overflow-hidden transition-all hover:shadow-md">
                <div className="aspect-video bg-muted">
                  {event.image_url ? (
                    <img
                      src={event.image_url || "/placeholder.svg"}
                      alt={event.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-primary/10">
                      <Calendar className="h-12 w-12 text-primary/40" />
                    </div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle>{event.title}</CardTitle>
                  <CardDescription>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize">
                      {event.status}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2 text-muted-foreground">
                    {event.description}
                  </p>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="mr-2 h-4 w-4" />
                      {format(new Date(event.date), "MMMM d, yyyy")}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="mr-2 h-4 w-4" />
                      {event.time}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="mr-2 h-4 w-4" />
                      {event.location}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
