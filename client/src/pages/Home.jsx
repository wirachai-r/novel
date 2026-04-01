import React from 'react'
import ContentBanner from "@/components/home/ContentBanner"
import PopularNovel from "@/components/home/PopularNovel"
import NovelUpdate from "@/components/home/NovelUpdate"

const Home = () => {
    return (
        <div className='gap-4 mb-10'>
            <ContentBanner />
            <NovelUpdate />
            <PopularNovel />
        </div>
    )
}

export default Home