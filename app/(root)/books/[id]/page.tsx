import { auth } from '@/auth';
import BookOverview from '@/components/BookOverview';
import BookVideo from '@/components/BookVideo';
import { db } from '@/database/db';
import { books } from '@/database/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import React from 'react'

const page = async ({params}:{params: Promise<{id: string}>}) => {

    const session = await auth();
    const id = (await params).id;

    const [bookDetails] = await db.select().from(books).where(eq(books.id,id)).limit(1);


    if(!bookDetails) redirect('/404');

    console.log(bookDetails);


  return (
    <>
      <BookOverview {...bookDetails}  userid={session?.user?.id} />

      <div className="books-details">
        <div className="flex-[1.5]">
            <section className="flex flex-col gap-7">
                <h3>Video</h3>
                <BookVideo videoUrl={bookDetails.videoUrl}/>
            </section>
            <section className="mt-10 flex flex-col gap-7">
                <h3>Summary</h3>
                <div className="space-y-5 text-xl text-light-500">
                    {bookDetails.summary.split('\n').map((line,i)=>(
                        <p key={i}>{line}</p>
                    ))}
                </div>
            </section>
        </div>
      </div>
    </>
  )
}

export default page
