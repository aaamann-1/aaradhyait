import axios from "axios";
import API_URL from "../../config/api";
import { getToken } from "./authService";

const auth = () => ({ Authorization: `Bearer ${getToken()}` });

export const getInquiries = async () => {
  const res = await axios.get(`${API_URL}/api/admin/inquiries`, { headers: auth() });
  return res.data.data;
};

export const getNewInquiriesCount = async (): Promise<number> => {
  const res = await axios.get(`${API_URL}/api/admin/inquiries/new-count`, { headers: auth() });
  return res.data.data.count;
};

export const updateInquiryStatus = async (id: number, status: string) => {
  const res = await axios.patch(
    `${API_URL}/api/admin/inquiries/${id}/status`,
    { status },
    { headers: auth() }
  );
  return res.data;
};

export const deleteInquiry = async (id: number) => {
  const res = await axios.delete(`${API_URL}/api/admin/inquiries/${id}`, { headers: auth() });
  return res.data;
};