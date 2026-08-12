const API_URL = "http://localhost:5000/api";

export const getRooms = async (params = {}) => {

    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {

        if (value !== undefined && value !== "") {
            query.append(key, value);
        }

    });

    const response = await fetch(
        `${API_URL}/rooms?${query.toString()}`
    );

    if (!response.ok) {
        throw new Error("Không thể lấy danh sách phòng");
    }

    return response.json();
};