"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { User } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { updateProfile } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-provider";

// Form schema with validation
const formSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z
    .string()
    .email({
      message: "Please enter a valid email address.",
    })
    .optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  bio: z
    .string()
    .max(500, {
      message: "Bio must not exceed 500 characters.",
    })
    .optional(),
});

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [profileData, setProfileData] = useState<Profile | null>(null);

  // useEffect(() => {
  //   if (!user) return;

  //   async function fetchProfile() {
  //     try {
  //       const profile = await getProfile(user!.id);
  //       setProfileData(profile);
  //       console.log("Profile variable:", profile);
  //       console.log("Profile Data state:", profileData);
  //     } catch (error) {
  //       console.error("Error fetching profile:", error);
  //       toast({
  //         variant: "destructive",
  //         title: "Failed to fetch profile",
  //         description:
  //           "There was an error fetching your profile. Please try again.",
  //       });
  //     }
  //   }

  //   fetchProfile();
  // }, [user]);

  // Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: user?.first_name || "",
      lastName: user?.last_name || "",
      email: user?.email || "",
      avatarUrl: user?.avatar_url || "",
      bio: user?.bio || "",
    },
  });

  // Form submission handler
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) return;

    setIsSubmitting(true);

    try {
      await updateProfile(user.id, {
        first_name: values.firstName,
        last_name: values.lastName,
        avatar_url: values.avatarUrl || null,
        bio: values.bio || null,
      });

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Failed to update profile",
        description:
          "There was an error updating your profile. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!user) {
    return null;
  }

  const initials = `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();

  return (
    <div className="container py-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
          <p className="text-muted-foreground">
            Manage your account settings and profile information.
          </p>
        </div>

        <Separator className="my-6" />

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>
                Update your personal information and profile details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4 sm:flex-row sm:items-start sm:space-x-4 sm:space-y-0">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src={user.avatar_url || undefined}
                    alt={user.first_name}
                  />
                  <AvatarFallback className="text-xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-1 text-center sm:text-left">
                  <h3 className="font-medium">
                    {user.first_name} {user.last_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Member since{" "}
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <Separator className="my-6" />

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="name@example.com"
                              {...field}
                              disabled
                            />
                          </FormControl>
                          <FormDescription>
                            Email cannot be changed.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="avatarUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Avatar URL</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="https://example.com/avatar.jpg"
                                {...field}
                                value={field.value || ""}
                              />
                              <User className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Enter a URL to an image for your profile picture.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="sm:col-span-2">
                      <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Tell us a little about yourself"
                                className="resize-none"
                                rows={4}
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription>
                              Brief description for your profile. Max 500
                              characters.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Saving...
                        </div>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
