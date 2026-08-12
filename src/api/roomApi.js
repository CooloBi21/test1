const API_URL = import.meta.env.VITE_API_URL || "https://test1-be-845w.onrender.com";

export const getRooms = async (params = {}) => {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
            query.append(key, value);
        }
    });

    const response = await fetch(
        `${API_URL}/api/rooms?${query.toString()}`
    );

    if (!response.ok) {
        throw new Error("Không thể lấy danh sách phòng");
    }

    return response.json();
};