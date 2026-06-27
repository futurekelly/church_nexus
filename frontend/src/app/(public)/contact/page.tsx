"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { PublicNavbar } from "@/features/landing/components/public-navbar";
import { PublicFooter } from "@/features/landing/components/public-footer";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { AuthButton } from "@/features/auth/components/auth-button";
import { useTranslation } from "@/hooks/use-translation";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  subject: z.string().min(1, "Subject is required").max(150, "Subject is too long"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    // Simulate API request submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    toast.success("Thank you for contacting us! Your inquiry has been sent successfully.");
    reset();
  };

  return (
    <div className="min-h-screen bg-background text-primary-foreground">
      <PublicNavbar />

      <main id="main-content" className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="text-center">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-primary-foreground sm:text-5xl">
            {t("public.contact.title")}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            {t("public.contact.subtitle")}
          </p>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-5">
          {/* Info Section */}
          <div className="space-y-6 lg:col-span-2">
            <div className="glass-panel rounded-2xl border border-border/50 p-8 shadow-glass">
              <h2 className="font-display text-2xl font-bold text-primary-foreground">Contact Information</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Feel free to visit us or reach out via phone or email. Our team is always happy to connect with you.
              </p>

              <div className="mt-8 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-primary-foreground">Address</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Headquarters Branch<br />
                      100 Church St, kisutu , mlalakuwa 10001
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-primary-foreground">Phone</h3>
                    <p className="mt-1 text-sm text-muted-foreground">+255 678 302 135</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-primary-foreground">Email</h3>
                    <p className="mt-1 text-sm text-muted-foreground">info@churchnexus.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-primary-foreground">Office Hours</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Mon - Fri: 9:00 AM - 5:00 PM<br />
                      Sun: 8:00 AM - 1:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="lg:col-span-3">
            <div className="glass-panel rounded-2xl border border-border/50 p-8 shadow-glass">
              <h2 className="font-display text-2xl font-bold text-primary-foreground">Send Message</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-muted-foreground">Full Name</label>
                    <input
                      id="name"
                      type="text"
                      className="w-full rounded-lg border border-border bg-card/50 px-4 py-2.5 text-sm text-primary-foreground transition-colors focus:border-primary focus:outline-none"
                      placeholder="Alfred Denis"
                      {...register("name")}
                    />
                    {errors.name && <p className="text-xs text-warning">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-muted-foreground">Email Address</label>
                    <input
                      id="email"
                      type="email"
                      className="w-full rounded-lg border border-border bg-card/50 px-4 py-2.5 text-sm text-primary-foreground transition-colors focus:border-primary focus:outline-none"
                      placeholder="alfred@example.com"
                      {...register("email")}
                    />
                    {errors.email && <p className="text-xs text-warning">{errors.email.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium text-muted-foreground">Subject</label>
                  <input
                    id="subject"
                    type="text"
                    className="w-full rounded-lg border border-border bg-card/50 px-4 py-2.5 text-sm text-primary-foreground transition-colors focus:border-primary focus:outline-none"
                    placeholder="How can we help you?"
                    {...register("subject")}
                  />
                  {errors.subject && <p className="text-xs text-warning">{errors.subject.message}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-muted-foreground">Message</label>
                  <textarea
                    id="message"
                    rows={5}
                    className="w-full rounded-lg border border-border bg-card/50 px-4 py-2.5 text-sm text-primary-foreground transition-colors focus:border-primary focus:outline-none resize-none"
                    placeholder="Your message details..."
                    {...register("message")}
                  />
                  {errors.message && <p className="text-xs text-warning">{errors.message.message}</p>}
                </div>

                <AuthButton isLoading={isSubmitting} className="w-full flex items-center justify-center gap-2">
                  <Send className="h-4 w-4" />
                  {t("public.contact.submit_btn")}
                </AuthButton>
              </form>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
