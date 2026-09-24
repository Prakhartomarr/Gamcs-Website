import Foundation
import Vision
import AppKit
import CoreImage

// segment <in> <outMaskPng>   — person mask at the image's own size, white = person.
let args = Array(CommandLine.arguments.dropFirst())
guard args.count == 2,
      let img = NSImage(contentsOfFile: args[0]),
      let cg = img.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
    FileHandle.standardError.write("usage: segment in.jpg mask.png\n".data(using: .utf8)!); exit(1)
}
let req = VNGeneratePersonSegmentationRequest()
req.qualityLevel = .accurate
req.outputPixelFormat = kCVPixelFormatType_OneComponent8
let handler = VNImageRequestHandler(cgImage: cg, options: [:])
try handler.perform([req])
guard let pb = (req.results?.first)?.pixelBuffer else { print("NONE"); exit(2) }
let ci = CIImage(cvPixelBuffer: pb)
let scale = CGAffineTransform(scaleX: CGFloat(cg.width) / ci.extent.width,
                              y: CGFloat(cg.height) / ci.extent.height)
let scaled = ci.transformed(by: scale)
let ctx = CIContext()
guard let out = ctx.createCGImage(scaled, from: CGRect(x: 0, y: 0, width: cg.width, height: cg.height)),
      let dest = CGImageDestinationCreateWithURL(URL(fileURLWithPath: args[1]) as CFURL, "public.png" as CFString, 1, nil) else {
    print("FAIL"); exit(3)
}
CGImageDestinationAddImage(dest, out, nil)
CGImageDestinationFinalize(dest)
print("\(cg.width)x\(cg.height)")
