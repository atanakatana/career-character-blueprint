import type { Metadata } from 'next'
import { PixelLayout }          from '@/components/layout/PixelLayout'
import { CharacterCreationForm } from '@/components/form/CharacterCreationForm'

export const metadata: Metadata = {
  title: 'Create Your Character | Character Career Blueprint',
  description: 'Answer 9 questions to generate your personalized career blueprint.',
}

export default function CreatePage() {
  return (
    <PixelLayout>
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-12">
        <CharacterCreationForm />
      </div>
    </PixelLayout>
  )
}
