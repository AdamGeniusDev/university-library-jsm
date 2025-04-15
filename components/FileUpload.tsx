"use client";

import config from "@/lib/config";
import { IKImage, ImageKitProvider, IKUpload, IKVideo,} from "imagekitio-next";
import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { cn } from "@/lib/utils";



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

};

interface Props {
  type: 'image' |'video';
  accept: string;
  placeholder: string;
  folder: string;
  variant: 'dark' | 'light';
  onFileChange: (filePath: string) => void;
  value?: string;
}


const FileUpload = ({
   onFileChange,
   type,
   accept,
   placeholder,
   folder,
   variant,value}: Props) => {

    
  const ikUploadRef = useRef<HTMLInputElement>(null);
  const [file,setFile] = useState
  <{filePath: string | null}>({filePath: value ?? null});
  const [progress,setProgress] = useState(0);

  const styles = {
    button: variant === 'dark'? 'bg-dark-300' : 'bg-light-600 border-gray-100 border',
    placeholder: variant === 'dark'? 'text-light-100' : 'text-slate-500',
    text: variant === 'dark'? 'text-light-100' : 'text-dark-500'
  }
  const onError = (error:any) => {
    console.log(error);

    toast(`${type} uploaded failed`,{
      description: `Your ${type} could not be uploaded. Please try again`,
    })
  }
  const onSuccess = (res:any) => {
    setFile(res);
    onFileChange(res.filePath);

    toast(`${type} Uploaded successfully`,{
      description: `${res.filePath} uploaded successfully`
    })
  }
const onValidate = (file: File) => {
  if(type === 'image') {
    if(file.size >20*1024*1024){
      toast('File size is too large',{
        description: 'Please upload a file that is less than 20MB in size'
      });
      return false;
    }
  } else if( type ==='video'){
    if(file.size > 50*1024*1024){
      toast('File size is too large',{
        description: 'Please upload a file that is less than 50MB in size'
      });
      return false;
    }
  }
  return true;
}

  return (<ImageKitProvider publicKey={publicKey} 
  urlEndpoint={urlEndpoint}
  authenticator={authenticator}
  >
    <IKUpload className="hidden" 
    validateFile={onValidate}
    onUploadStart={() => setProgress(0)}
    onUploadProgress={({loaded,total})=>{
      const percent = Math.round((loaded/total)*100);
        setProgress(percent);
    }}
    folder={folder}
    accept = {accept}
    ref={ikUploadRef} 
    onError={onError} 
    onSuccess={onSuccess}  
    useUniqueFileName={true}/>

    <button className={cn('upload-btn',styles.button)} onClick={(e)=>{
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
         <p className={cn('text-base', styles.placeholder)}>{placeholder}</p>
          {file && (
            <p className={cn("upload-filename", styles.text)}>{file.filePath}</p>
          )}
        {progress>0 && progress!==100 && (
          <div className="w-full rounded-full bg-green-200">
            <div className="progress" style={{width: `${progress}%`}}>
              {progress}% 
            </div>
          </div>
        )}
    </button>

    {file && (type === 'image'? (
      <IKImage 
      alt={file.filePath}
      path={file.filePath}
      width={300}
      height={300}
      />
    ): type=== 'video'? (
      <IKVideo 
      path={file.filePath}
      controls={true}
      className="h-96 w-full rounded-xl"
      />
    ):null)
    } 
  </ImageKitProvider>
  );
};

export default FileUpload;
