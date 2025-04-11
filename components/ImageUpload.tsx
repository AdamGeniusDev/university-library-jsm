"use client";

import config from "@/lib/config";
import { IKImage, ImageKitProvider, IKUpload,} from "imagekitio-next";
import ImageKit from "imageKit";
import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";



const {env:{
  imagekit:{publicKey,urlEndpoint}
}}= config;


const authenticator = async () =>{
    try {
        const response = await fetch(`${config.env.apiEndpoint}/api/auth/imagekit`);

        if(!response.ok){
            const errorText = await response.text();

            throw new Error(`Request failed with status ${response.status}: ${errorText}`)
        }

        const data = await response.json();
        console.log("ImageKit Auth Response:", data);
        const {signature,expire,token} = data;

        return {token,expire,signature};
    } catch(error: any){
        throw new Error(`Authentication request failed: ${error.message}`)
    }

}
const ImageUpload = ({onFileChange}:{onFileChange: (filePath: string)=>void}) => {

    
  const ikUploadRef = useRef<HTMLInputElement>(null);
  const [file,setFile] = useState
  <{filePath: string}| null>(null);

  const onError = (error:any) => {
    console.log(error);

    toast("Image upload failed",{
      description: `Your image could not be uploaded. Please try again`,
    })
  }
  const onSuccess = (res:any) => {
    setFile(res);
    onFileChange(res.filePath);

    toast("Image Uploaded successfully",{
      description: `${res.filePath} uploaded successfully`
    })
  }
  return (<ImageKitProvider publicKey={publicKey} 
  urlEndpoint={urlEndpoint}
  authenticator={authenticator}
  >
    <IKUpload className="hidden" ref={ikUploadRef} onError={onError} onSuccess={onSuccess} fileName="test-upload.png" useUniqueFileName={true}/>

    <button className="upload-btn" onClick={(e)=>{
      e.preventDefault();
      if(ikUploadRef.current){
        ikUploadRef.current?.click();
      }
    }}>
        <Image src='/icons/upload.svg' alt="upload-icon"
        width={20}
        height={20}
        className="object-contain"
         />
         <p className="text-base text-light-100">Upload a file</p>

        {file && <p className="upload-filename">{file.filePath}</p>}
    </button>

    {file && (
      <IKImage 
      alt={file.filePath}
      path={file.filePath}
      width={300}
      height={300}
      />
    )}

    
  </ImageKitProvider>
  );
};

export default ImageUpload
