import type { AnchorHTMLAttributes } from 'react';
import { Link, type LinkProps } from 'react-router';

import styles from '@/shared/ui/TextLink/TextLink.module.css';

type InternalTextLinkProps = Omit<LinkProps, 'className'> & {
  className?: string;
  href?: never;
};

type ExternalTextLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'href'> & {
  className?: string;
  href: string;
  to?: never;
};

export type TextLinkProps = InternalTextLinkProps | ExternalTextLinkProps;

/**
 * 공용 text navigation control이다.
 *
 * CONTRACT: to prop은 React Router navigation을 사용하고,
 * href prop은 external/document URL을 위한 실제 anchor를 사용한다.
 * 어떤 semantics를 쓸지는 호출자가 명시적으로 선택한다.
 */
export function TextLink(props: TextLinkProps) {
  if ('href' in props) {
    const { className, href, ...anchorProps } = props;
    const classes = [styles.root, className].filter(Boolean).join(' ');

    return <a {...anchorProps} className={classes} href={href} />;
  }

  const { className, ...linkProps } = props;
  const classes = [styles.root, className].filter(Boolean).join(' ');

  return <Link {...linkProps} className={classes} />;
}
