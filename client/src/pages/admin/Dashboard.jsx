import React from 'react'
import SectionCards from "@/components/admin/section-cards"

const Dashboard = () => {
  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">

        <div className="px-4 lg:px-6">
          <div className='mb-5'>
          <SectionCards />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard