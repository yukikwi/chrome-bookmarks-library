"use client";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Book } from "@/lib/types/library";
import { Button } from "@/components/ui/button";
type Props = {};

function library({}: Props) {
	const router = useRouter();
	const [books, setBooks] = useState<Book[]>([
		{
			url: "http://hentaithai.com/forum/index.php?topic=13832.0",
			name: "ฟื้นฟูความจำ - [Karasu] Wild Therapy",
		},
	]);
	const { data: session, isPending } = authClient.useSession();

	const privateData = useQuery(trpc.privateData.queryOptions());

	useEffect(() => {
		if (!session && !isPending) {
			router.push("/login");
		}
	}, [session, isPending]);

	if (isPending) {
		return <div>Loading...</div>;
	}
	return (
		<div className="grid grid-cols-4">
			{books.map((book, index) => {
				return (
					<Card key={`${book.url}_${index}`}>
						<CardHeader>
							<CardTitle>{book.name}</CardTitle>
						</CardHeader>
						<CardContent>
							<Button onClick={() => window.open(book.url, "__blank")}>
								Go
							</Button>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}

export default library;
