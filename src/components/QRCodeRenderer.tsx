import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeRendererProps {
  value: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
  className?: string;
  includeMargin?: boolean;
}

export const QRCodeRenderer: React.FC<QRCodeRendererProps> = ({
  value,
  size = 180,
  fgColor = '#0F4C81',
  bgColor = '#FFFFFF',
  className = '',
  includeMargin = true,
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(value, {
      width: size * 2, // high res for crisp rendering & printing
      margin: includeMargin ? 2 : 0,
      color: {
        dark: fgColor,
        light: bgColor,
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (isMounted) {
          setDataUrl(url);
          setError(false);
        }
      })
      .catch((err) => {
        console.error('Failed to generate QR code', err);
        if (isMounted) setError(true);
      });

    return () => {
      isMounted = false;
    };
  }, [value, size, fgColor, bgColor, includeMargin]);

  if (error || !dataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex items-center justify-center bg-gray-100 text-gray-400 text-xs rounded border border-gray-200 ${className}`}
      >
        QR
      </div>
    );
  }

  return (
    <img
      src={dataUrl}
      alt="Código QR del Catálogo"
      width={size}
      height={size}
      className={`object-contain block ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
};
