import { createClient } from "@supabase/supabase-js";

// Define database types for better type safety
export type Event = {
  id: string;
  created_at: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image_url: string | null;
  status: "upcoming" | "ongoing" | "completed";
  user_id: string;
};

export type EventAttendee = {
  id: string;
  created_at: string;
  event_id: string;
  user_id: string;
};

export type Profile = {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
};

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Event service functions
export async function getEvents() {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("date", { ascending: true });

  if (error) {
    throw error;
  }

  return data as Event[];
}

export async function getEvent(id: string) {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  }

  return data as Event;
}

export async function getUserEvents(userId: string) {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: true });

  if (error) {
    throw error;
  }

  return data as Event[];
}

export async function createEvent(event: Omit<Event, "id" | "created_at">) {
  const { data, error } = await supabase
    .from("events")
    .insert([event])
    .select();

  console.log(`Event added to "events" table:`, event);
  
  if (error) {
    throw error;
  }

  return data[0] as Event;
}

export async function updateEvent(id: string, event: Partial<Event>) {
  const { data, error } = await supabase
    .from("events")
    .update(event)
    .eq("id", id)
    .select();

  if (error) {
    throw error;
  }

  return data[0] as Event;
}

export async function deleteEvent(id: string) {
  const { error } = await supabase.from("events").delete().eq("id", id);

  if (error) {
    throw error;
  }

  return true;
}

// Attendee functions
export async function getEventAttendees(eventId: string) {
  const { data, error } = await supabase
    .from("event_attendees")
    .select("*, profiles(*)")
    .eq("event_id", eventId);

  if (error) {
    throw error;
  }

  return data;
}

export async function joinEvent(eventId: string, userId: string) {
  const { data, error } = await supabase
    .from("event_attendees")
    .insert([{ event_id: eventId, user_id: userId }]);

  if (error) {
    throw error;
  }

  return true;
}

export async function leaveEvent(eventId: string, userId: string) {
  const { error } = await supabase
    .from("event_attendees")
    .delete()
    .eq("event_id", eventId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  return true;
}

export async function getUserAttendingEvents(userId: string) {
  const { data, error } = await supabase
    .from("event_attendees")
    .select("*, events(*)")
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  return data.map((item) => item.events) as Event[];
}

// Profile functions
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    throw error;
  }

  return data as Profile;
}

export async function updateProfile(userId: string, profile: Partial<Profile>) {
  const { data, error } = await supabase
    .from("profiles")
    .update(profile)
    .eq("id", userId)
    .select();

  if (error) {
    throw error;
  }

  return data[0] as Profile;
}
