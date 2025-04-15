'use client';

import Image from 'next/image'
import React, { useState } from 'react'
import { Button } from './ui/button'
import { redirect, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { borrowBook } from '@/lib/actions/book';

interface props {
    bookId: string;
    userId: string;
    borrowingEligibility: {
        isEligible: boolean
        message: string
    };
}

const BorrowBook = ({bookId,userId,borrowingEligibility:{isEligible,message}}: props) => {
    const router = useRouter();
    const [borrowing,setBorrowing] = useState(false);

    const handleBorrow = async()=> {
        if(!isEligible){
            toast('Error',{
                description: message,
            })
        }

        setBorrowing(true);

        try{
            const result = await borrowBook({bookId,userId});

            if(result.success){
                toast('Success',{
                    description: 'Book borrowed successfully'
                });
                router.push('/')
            } else {
                toast('Error',{
                    description: result.error,
                });
            };
        } catch(error) {
            toast('Error',{
                description:"An error occurred while borrowing the book",
            })
        } finally {
            setBorrowing(false);
        }
    }
  return (
    <div>
      <Button className="book_overview_btn" onClick={handleBorrow} disabled={borrowing}>
            <Image src="/icons/book.svg" alt="book" width={20} height={20}/>
            <p className="font-bebas-neue text-xl text-dark-100">{borrowing? 'Borrowing...': 'Borrow Book'}</p>
           </Button>
    </div>
  )
}

export default BorrowBook
