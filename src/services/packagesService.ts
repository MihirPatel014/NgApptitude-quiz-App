import { userLoginResults, UserRegistrationResults } from "../common/constant";
import { ApiResponse, handleApiResponse } from "../common/http-common";
import http from "../common/http-common"
import { Packages, PackagesInfo, UserPackagesModel } from "../types/package"
import { apiRequest } from "../common/requestwithdata"
import { PackageId } from "typescript";
// api/User/Register
const PACKAGE_URL = 'api/Package';

const GET_PACKAGE_BY_ID = "/GetPackageById"
const GET_ALL_PACKAGES = "/GetAllPackages"
const ADD_PACKAGE = "/AddPackage"
const UPDATE_PACKAGE = "/UpdatePackage"
const DELTE_PACKAGE = "/DeletePackage"
const GET_PACKAGE_INFO_BY_PACKAGE_ID = "/GetPackageInfoByPackageId"
const GET_USER_CURRENT_PACKAGE_INFO_BY_USER_ID = "/GetUserCurrentPackageInfoByUserId"

export const getAllPackages = async () => {

  // return http.get<Array<Packages>>(`/${PACKAGE_URL}${GET_ALL_PACKAGES}`);
  const result = await apiRequest<null, Array<Packages>>(
    `/${PACKAGE_URL}${GET_ALL_PACKAGES}`,
    "POST",
    null
  );
  if (result.success) {
    return result.data; // Return the packages data
  } else {
    console.log("Error fetching packages:", result.errors);
    return null;
  }
};
export const getPackageInfoByPackageId = async (packageId: number) => {
  if (packageId > 0) {

    const result = await apiRequest< typeof packageId, PackagesInfo>(
      `/${PACKAGE_URL}${GET_PACKAGE_INFO_BY_PACKAGE_ID}`,
      "POST",
       packageId  // Pass the packageId as part of the request body
    );

    if (result.success) {
      return result.data; // Return the package data
    } else {
      console.log("Error fetching packages:", result.errors);
      return null;
    }
  }
};
export const getUserCurrentPackageInfoByUserId = async (userId: number) => {
  if (userId > 0) {

    const result = await apiRequest< typeof userId, UserPackagesModel>(
      `/${PACKAGE_URL}${GET_USER_CURRENT_PACKAGE_INFO_BY_USER_ID}`,
      "POST",
      userId  // Pass the packageId as part of the request body
    );

    if (result.success) {
      return result.data; // Return the package data
    } else {
      console.log("Error fetching packages:", result.errors);
      return null;
    }
  }
};

export const get = (id: any) => {
  return http.get<Packages>(`/${PACKAGE_URL}/${id}`);
};

export const create = (data: Packages) => {
  return http.post<Packages>(`/${PACKAGE_URL}`, data);
};

export const update = (id: any, data: Packages) => {
  return http.put<any>(`/${PACKAGE_URL}/${id}`, data);
};

export const remove = (id: any) => {
  return http.delete<any>(`/${PACKAGE_URL}/${id}`);
};

export const removeAll = () => {
  return http.delete<any>(`/${PACKAGE_URL}`);
};
