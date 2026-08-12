const API_URL = "http://localhost:5000/api";

export const getProvinces = async () => {

    const response = await fetch(
        `${API_URL}/provinces`
    );

    if (!response.ok) {
        throw new Error("Không thể lấy danh sách tỉnh");
    }

    return response.json();
};


export const getDistricts = async (parentCode = "") => {

    const query = parentCode
        ? `?parent_code=${parentCode}`
        : "";

    const response = await fetch(
        `${API_URL}/districts${query}`
    );

    if (!response.ok) {
        throw new Error("Không thể lấy danh sách quận/huyện");
    }

    return response.json();
};