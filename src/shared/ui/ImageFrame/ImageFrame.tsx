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
 * Keeps image loading/failure presentation local to the media surface.
 *
 * INVARIANT: Image failure alone must not convert the parent data section into
 * an API Error. The caller owns image meaning through an explicit alt string
 * and may provide a Feature-specific fallback when useful.
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
