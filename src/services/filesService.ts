import { ApiResponse } from "../common/http-common";

export interface FetchUploadPath {
    imageUrl: string;
}

const DOCU_API_URL = process.env.REACT_APP_DOCU_API_URL;
const DOCU_API_KEY = process.env.REACT_APP_DOCU_API_KEY;

/**
 * Fetches the base folder path for a given image name from the document API.
 * @param fileName The name of the file to get the path for.
 * @returns A promise that resolves to FetchUploadPath containing the folder URL, or null if it fails.
 */
export const getImageUrlByName = async (fileName: string): Promise<FetchUploadPath | null> => {
    try {
        const url = `${DOCU_API_URL}api/FileUpload/GetImageUrlByName/${fileName}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-Project-Key': DOCU_API_KEY || '',
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const apiResponse: ApiResponse<FetchUploadPath> = await response.json();

            if (apiResponse?.isSuccess && apiResponse?.data?.imageUrl) {
                const fullUrl = apiResponse.data.imageUrl;
                try {
                    const urlObj = new URL(fullUrl);

                    // const pathSegments = urlObj.pathname.split('/');

                    // // Remove the last two segments (e.g., 'questions/filename.png')
                    // // pathSegments[0] is usually empty if path starts with /
                    // const newPathSegments = pathSegments.slice(0, pathSegments.length - 2);

                    // const folderPath = `${urlObj.origin}${newPathSegments.join('/')}/`;
                    // return {
                    //     imageUrl: folderPath
                    // };
                    return {
                        imageUrl: fullUrl
                    }
                } catch (urlError) {
                    console.log("Error parsing URL:", urlError);
                    return apiResponse.data;
                }
            }
            return apiResponse?.data || null;
        }
        return null;
    } catch (error) {
        console.log("Error in getImageUrlByName:", error);
        return null;
    }
};
