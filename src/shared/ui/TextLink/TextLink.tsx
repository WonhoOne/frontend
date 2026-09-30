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
 * Shared text navigation control.
 *
 * CONTRACT: The to prop uses React Router navigation. The href prop uses a
 * real anchor for external/document URLs. Callers choose semantics explicitly.
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
