const API_URL =
    import.meta.env.VITE_API_URL ||
    "https://test1-be-845w.onrender.com";


// ========================================
// GET PROVINCES
// ========================================

export const getProvinces = async () => {

    const response = await fetch(
        `${API_URL}/api/provinces`
    );

    if (!response.ok) {

        throw new Error(
            "Không thể lấy tỉnh/thành"
        );

    }

    return response.json();
};


// ========================================
// GET DISTRICTS
// ========================================

export const getDistricts = async (
    parentCode = null
) => {

    let url =
        `${API_URL}/api/districts`;


    // Nếu có tỉnh được chọn
    if (parentCode) {

        url =
            `${API_URL}/api/districts/by-province?parentCode=${encodeURIComponent(parentCode)}`;

    }

    const response =
        await fetch(url);

    if (!response.ok) {

        throw new Error(
            "Không thể lấy quận/huyện"
        );

    }

    return response.json();
};