import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { TrendingUp, Loader2, UserPlus, Gift } from "lucide-react";

const schema = z.object({
  username: z.string().min(3, "Minst 3 tegn").max(20, "Maks 20 tegn"),
  email: z.string().email("Ugyldig e-postadresse"),
  password: z.string().min(6, "Minst 6 tegn"),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passordene stemmer ikke overens",
  path: ["confirmPassword"],
});

export default function Register() {
  const { refreshUser } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { username: "", email: "", password: "", confirmPassword: "" },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: { username: string; email: string; password: string }) => {
      const res = await apiRequest("POST", "/api/auth/register", data);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }
      return res.json();
    },
    onSuccess: () => {
      refreshUser();
      navigate("/");
      toast({ title: "Konto opprettet!", description: "Du fikk 1000 kr i velkomstbonus!" });
    },
    onError: (err: Error) => {
      toast({ title: "Feil", description: err.message, variant: "destructive" });
    },
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    const { confirmPassword, ...rest } = data;
    await registerMutation.mutateAsync(rest);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
              <TrendingUp className="h-7 w-7 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">NordCasino</h1>
          <p className="text-muted-foreground text-sm">Norges beste online casino</p>
        </div>

        <div className="rounded-md bg-accent border border-border p-3 flex items-center gap-3">
          <Gift className="h-5 w-5 text-primary shrink-0" />
          <div>
            <p className="text-sm font-medium">Velkomstbonus</p>
            <p className="text-xs text-muted-foreground">Få 1000 kr gratis ved registrering!</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Opprett konto</CardTitle>
            <CardDescription>Fyll ut skjemaet for å komme i gang</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="username" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brukernavn</FormLabel>
                    <FormControl>
                      <Input placeholder="ditt_brukernavn" data-testid="input-username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-post</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="din@epost.no" data-testid="input-email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Passord</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••" data-testid="input-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bekreft passord</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••" data-testid="input-confirm-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="w-full gap-2" data-testid="button-register" disabled={registerMutation.isPending}>
                  {registerMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                  Registrer deg
                </Button>
              </form>
            </Form>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Har du allerede konto?{" "}
              <Link href="/login">
                <span className="text-primary cursor-pointer font-medium">Logg inn</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
