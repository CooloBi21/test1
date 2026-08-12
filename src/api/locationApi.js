const API_URL = import.meta.env.VITE_API_URL || "https://test1-be-845w.onrender.com";

export const getProvinces = async () => {
    const response = await fetch(
        `${API_URL}/api/provinces`
    );

    if (!response.ok) {
        throw new Error("Không thể lấy tỉnh/thành");
    }

    return response.json();
};


export const getDistricts = async () => {
    const response = await fetch(
        `${API_URL}/api/districts`
    );

    if (!response.ok) {
        throw new Error("Không thể lấy quận/huyện");
    }

    return response.json();
};