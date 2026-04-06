import { useState, useEffect } from "react";

/**
 * Trì hoãn việc cập nhật giá trị trong một khoảng thời gian nhất định (Debounce).
 * @param value Giá trị cần theo dõi
 * @param delay Thời gian trễ (ms)
 * @returns Giá trị đã được trì hoãn
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}