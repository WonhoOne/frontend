import type { CSSProperties, HTMLAttributes, ImgHTMLAttributes, ReactNode } from 'react';
import { useState } from 'react';

import styles from '@/shared/ui/ImageFrame/ImageFrame.module.css';

type ImageFrameState = 'placeholder' | 'loading' | 'loaded' | 'failed';

export type ImageFrameObjectFit = 'cover' | 'contain';
export type ImageFrameRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export interface ImageFrameProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  src?: string;
  alt: string;
  aspectRatio: CSSProperties['aspectRatio'];
  objectFit?: ImageFrameObjectFit;
  loading?: ImgHTMLAttributes<HTMLImageElement>['loading'];
  fallback?: ReactNode;
  radius?: ImageFrameRadius;
}

interface ImageLoadState {
  src: string | null;
  state: ImageFrameState;
}

/**
 * 이미지 loading/failure 표현을 media surface 내부에 한정한다.
 *
 * INVARIANT: 이미지 실패만으로 상위 data section을 API Error로 바꾸지 않는다.
 * 이미지의 의미는 호출자가 명시적인 alt로 소유하며,
 * 필요하면 Feature 전용 fallback을 제공할 수 있다.
 */
export function ImageFrame({
  alt,
  aspectRatio,
  className,
  fallback,
  loading = 'lazy',
  objectFit = 'cover',
  radius = 'none',
  src,
  style,
  ...rest
}: ImageFrameProps) {
  const currentSrc = src === undefined || src.length === 0 ? null : src;
  const [loadState, setLoadState] = useState<ImageLoadState>(() => ({
    src: currentSrc,
    state: currentSrc === null ? 'placeholder' : 'loading',
  }));

  const state =
    loadState.src === currentSrc
      ? loadState.state
      : currentSrc === null
        ? 'placeholder'
        : 'loading';

  const classes = [styles.root, styles[`radius${capitalize(radius)}`], className]
    .filter(Boolean)
    .join(' ');

  const frameStyle = {
    ...style,
    aspectRatio,
    '--image-frame-object-fit': objectFit,
  } as CSSProperties;

  return (
    <div {...rest} className={classes} data-image-state={state} style={frameStyle}>
      <div aria-hidden="true" className={styles.placeholder} />

      {currentSrc !== null ? (
        <img
          alt={alt}
          className={styles.image}
          data-image-state={state}
          hidden={state === 'failed'}
          loading={loading}
          onError={() => {
            setLoadState({ src: currentSrc, state: 'failed' });
          }}
          onLoad={() => {
            setLoadState({ src: currentSrc, state: 'loaded' });
          }}
          src={currentSrc}
        />
      ) : null}

      {state === 'failed' && fallback !== undefined ? (
        <div className={styles.fallback}>{fallback}</div>
      ) : null}
    </div>
  );
}

function capitalize(value: ImageFrameRadius) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
