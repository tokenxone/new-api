/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { ConfigDrawer } from '@/components/config-drawer'
import { Search } from '@/components/search'
import { SidebarTrigger } from '@/components/ui/sidebar'

import { PublicHeader } from './public-header'

export function AppHeader() {
  return (
    <PublicHeader
      workspace
      workspaceTools={
        <>
          <SidebarTrigger variant='ghost' className='size-8' />
          <Search className='size-8 flex-none p-0 sm:w-8 sm:pe-0 lg:w-8 xl:w-8 [&>kbd]:hidden [&>span]:hidden' />
          <ConfigDrawer />
        </>
      }
      mobileWorkspaceTools={
        <SidebarTrigger variant='ghost' className='size-8' />
      }
      mobileMenuTools={
        <>
          <Search />
          <ConfigDrawer />
        </>
      }
    />
  )
}
