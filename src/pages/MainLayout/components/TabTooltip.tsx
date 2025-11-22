import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { findMenuPath } from '../utils/menuPath';
import { TabItem } from '../index';
import styles from '../styles.module.css';

interface TabTooltipProps {
    tab: TabItem;
    position: { x: number; y: number };
    onClose: () => void;
}

const TabTooltip: React.FC<TabTooltipProps> = ({ tab, position, onClose }) => {
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [adjustedPosition, setAdjustedPosition] = useState(position);
    const [isFadingOut, setIsFadingOut] = useState(false);
    const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

    // 查找菜单路径
    const menuPath = findMenuPath(tab.id || tab.pageId || '');

    // 显示2秒后开始淡出，然后关闭
    useEffect(() => {
        const fadeOutTimer = setTimeout(() => {
            setIsFadingOut(true);
            // 淡出动画持续 0.3 秒后关闭
            closeTimerRef.current = setTimeout(() => {
                onClose();
            }, 300);
        }, 2000);

        return () => {
            clearTimeout(fadeOutTimer);
            if (closeTimerRef.current) {
                clearTimeout(closeTimerRef.current);
            }
        };
    }, [onClose]);

    // 调整位置，确保不超出屏幕边界
    useEffect(() => {
        if (!tooltipRef.current) return;

        const tooltip = tooltipRef.current;
        const tooltipRect = tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const tooltipWidth = tooltipRect.width;
        const tooltipHeight = tooltipRect.height;

        let left = position.x;
        let top = position.y - tooltipHeight - 8; // 显示在鼠标上方

        // 如果超出左边界
        if (left < 8) {
            left = 8;
        }

        // 如果超出右边界
        if (left + tooltipWidth > viewportWidth - 8) {
            left = viewportWidth - tooltipWidth - 8;
        }

        // 如果超出上边界，显示在鼠标下方
        if (top < 8) {
            top = position.y + 24;
        }

        // 如果超出下边界
        if (top + tooltipHeight > viewportHeight - 8) {
            top = viewportHeight - tooltipHeight - 8;
        }

        setAdjustedPosition({ x: left, y: top });
        // viewportWidth 和 viewportHeight 是动态获取的，不需要添加到依赖数组
         
    }, [position]);

    // 如果没有菜单路径，不显示提示
    if (!menuPath) {
        return null;
    }

    return createPortal(
        <div
            ref={tooltipRef}
            className={`${styles.tabTooltip} ${isFadingOut ? styles.fadingOut : ''}`}
            style={{
                position: 'fixed',
                left: `${adjustedPosition.x}px`,
                top: `${adjustedPosition.y}px`,
            }}
        >
            <div className={styles.tooltipContent}>
                <div className={styles.tooltipLevel1}>{menuPath.level1}</div>
                {menuPath.level2 && (
                    <>
                        <span className={styles.tooltipSeparator}>›</span>
                        <div className={styles.tooltipLevel2}>{menuPath.level2}</div>
                    </>
                )}
                {menuPath.level3 && (
                    <>
                        <span className={styles.tooltipSeparator}>›</span>
                        <div className={styles.tooltipLevel3}>{menuPath.level3}</div>
                    </>
                )}
            </div>
        </div>,
        document.body
    );
};

export default TabTooltip;

