// import { httpClient } from "$/services/utils/httpClient";

// export const loginUser = async (email, userPassword) => {
//   const params = new URLSearchParams();
//   params.append("email", email);
//   params.append("password", userPassword);
//   const response = await httpClient.getAll(`/admin/login?${params}`);

//   const data = response.data;

//   const { userProfile } = data.payload; // get token and userProfile from payload
//   const { password, ...userData } = userProfile; // Exclude password from user data

//   // localStorage.setItem("sys_user_token", token);
//   localStorage.setItem("user_profile", JSON.stringify(userData));

//   return { ...data, userProfile: userData };
// };
