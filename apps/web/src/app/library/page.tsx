"use client";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { BadgeCheckIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";

function library() {
  const router = useRouter();

  const {
    data: books,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery(
    trpc.getBooks.infiniteQueryOptions(
      {
        limit: 20,
      },
      {
        // Any Tanstack React Query options
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    ),
  );
  const randomBookMutation = useMutation(trpc.getRandomBook.mutationOptions());

  const { data: session, isPending } = authClient.useSession();
  const displayBooks = useMemo(() => {
    return (books?.pages ?? [])?.flatMap((page) => {
      return (page.items ?? [])?.map((book) => {
        return {
          ...book,
          hostname: new URL(book.url).hostname,
        };
      });
    });
  }, [books]);

  useEffect(() => {
    if (!session && !isPending) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  const handleRandomBook = async () => {
    const randomBook = await randomBookMutation.mutateAsync();
    if (!randomBook) {
      toast.error("Failed to get random book");
      return;
    }
    window.open(randomBook?.url, "__blank");
  };

  if (isPending) {
    return <div>Loading...</div>;
  }
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-2 py-4 sm:gap-2">
      <section className="flex justify-end gap-2">
        <Button
          className="hover:cursor-pointer"
          variant="outline"
          onClick={() => handleRandomBook()}
        >
          Random
        </Button>
        <Button
          className="hover:cursor-pointer"
          onClick={() => router.push("/library/import")}
        >
          Import books
        </Button>
      </section>
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {displayBooks.map((book, index) => {
          return (
            <Card key={`${book.url}_${index}`} className="h-fit">
              <CardHeader>
                <CardTitle className="line-clamp-2">{book.name}</CardTitle>
                <Badge
                  variant="secondary"
                  className="bg-blue-500 text-white dark:bg-blue-600"
                >
                  <BadgeCheckIcon />
                  {book.hostname}
                </Badge>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full hover:cursor-pointer"
                  onClick={() => window.open(book.url, "__blank")}
                >
                  Read
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </section>
      <section>
        <Button
          className="w-full hover:cursor-pointer"
          variant="ghost"
          onClick={() => fetchNextPage()}
          disabled={!hasNextPage}
        >
          Load more
        </Button>
      </section>
    </div>
  );
}

export default library;
