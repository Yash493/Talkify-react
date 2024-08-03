import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase"; // Adjust the import path as needed

const upload = async (file) => {
    const date=new Date()
    const storageRef = ref(storage, `images/${date+ file.name}`);

    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
            },
            (error) => {
                // Handle unsuccessful uploads
                reject("Something went wrong! " + error.message);
            },
            () => {
                // Handle successful uploads
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    resolve(downloadURL);
                }).catch((error) => {
                    reject("Failed to get download URL: " + error.message);
                });
            }
        );
    });
};

export default upload
