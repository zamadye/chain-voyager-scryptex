
import { ReactNode } from 'react';
import ChainFirstLayout from '@/components/navigation/ChainFirstLayout';

interface LayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <ChainFirstLayout>
      {children}
    </ChainFirstLayout>
  );
};

export default Layout;
