// Format tien te (VND)
export const formatCurrencyVND = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Chuyen doi Byte sang GB
export const formatBytesToGB = (bytes: number): string => {
    const gb = bytes / Math.pow(1024, 3);
    return `${gb.toFixed(2)} GB`;
};

// Format ngay thang
export const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
};